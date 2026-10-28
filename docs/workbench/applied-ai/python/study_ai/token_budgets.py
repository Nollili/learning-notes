# study_ai/token_budgets.py
from __future__ import annotations

import asyncio
from dataclasses import dataclass

from openai import APIConnectionError, APIStatusError, APITimeoutError, AsyncOpenAI

from .model_sdk import (LabelDecision, ModelFailure, label_messages, label_text_format,
                        propose_label, validate_label_input)


class ContextBudgetExceeded(Exception):
    pass


@dataclass(frozen=True, slots=True)
class TokenBudget:
    context_window: int
    model_output_limit: int
    output_cap: int = 1024
    margin: int = 128

    def __post_init__(self) -> None:
        values = (self.context_window, self.model_output_limit, self.output_cap, self.margin)
        if any(type(value) is not int for value in values):
            raise ValueError("Token limits must be integers")
        if not (1 <= self.context_window <= 10000000 and 1 <= self.model_output_limit <= 10000000
                and 1 <= self.output_cap <= min(32768, self.model_output_limit) and self.margin >= 0
                and self.output_cap + self.margin < self.context_window):
            raise ValueError("Invalid token budget")

    def admit(self, input_tokens: int) -> None:
        if type(input_tokens) is not int or input_tokens < 0:
            raise ModelFailure("invalid_output")
        if input_tokens + self.output_cap + self.margin > self.context_window:
            raise ContextBudgetExceeded("Input exceeds the configured context budget")


async def propose_with_budget(client: AsyncOpenAI, *, model: str, source: str,
                              budget: TokenBudget) -> LabelDecision:
    validate_label_input(model=model, source=source)
    try:
        # One overall deadline includes preflight plus the generation call.
        async with asyncio.timeout(12.0):
            counted = await client.responses.input_tokens.count(
                model=model, input=label_messages(source), text=label_text_format(),
            )
            budget.admit(counted.input_tokens)
            return await propose_label(client, model=model, source=source, output_cap=budget.output_cap)
    except (APITimeoutError, TimeoutError):
        raise ModelFailure("timeout") from None
    except APIConnectionError:
        raise ModelFailure("provider_unavailable") from None
    except APIStatusError as error:
        raise ModelFailure("provider_unavailable" if error.status_code == 429 or error.status_code >= 500
                           else "provider_rejected") from None
