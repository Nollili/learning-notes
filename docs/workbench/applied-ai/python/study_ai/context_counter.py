# study_ai/context_counter.py
from openai import AsyncOpenAI
from openai.types.responses import ResponseInputParam, ResponseTextConfigParam

from .retrieval_pipeline import Counter


def context_counter(client: AsyncOpenAI, *, model: str) -> Counter:
    async def count(messages: ResponseInputParam, text: ResponseTextConfigParam) -> int:
        result = await client.responses.input_tokens.count(model=model, input=messages, text=text)
        return result.input_tokens
    return count
