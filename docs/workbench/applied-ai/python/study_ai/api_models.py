# study_ai/api_models.py
from pydantic import BaseModel, ConfigDict, Field, field_validator

from basics import clean_tags


class DocumentInput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    id: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    body: str = Field(min_length=1, max_length=20000)
    tags: list[str] = Field(default_factory=list, max_length=10)

    @field_validator("body")
    @classmethod
    def valid_body(cls, value: str) -> str:
        result = value.strip()
        if not result:
            raise ValueError("Body is required")
        result.encode("utf-8", errors="strict")
        return result

    @field_validator("tags")
    @classmethod
    def valid_tags(cls, values: list[str]) -> list[str]:
        result = list(clean_tags(values))
        for tag in result:
            tag.encode("utf-8", errors="strict")
        return result


class DocumentOutput(BaseModel):
    model_config = ConfigDict(strict=True, extra="forbid")
    id: str
    tags: list[str]
