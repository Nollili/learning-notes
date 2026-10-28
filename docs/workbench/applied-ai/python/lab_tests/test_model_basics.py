# lab_tests/test_model_basics.py
import math

import pytest

from study_ai.model_basics import fit_linear


def test_training_produces_parameters_inference_preserves_them():
    examples = [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0)]
    model = fit_linear(examples)
    before = (model.slope, model.intercept)
    assert before == (2.0, 1.0)
    assert model.predict(4.0) == 9.0
    assert model.predict(4.0) == 9.0
    assert (model.slope, model.intercept) == before
    assert examples == [(1.0, 3.0), (2.0, 5.0), (3.0, 7.0)]
    retrained = fit_linear([*examples, (4.0, 100.0)])
    assert retrained.predict(4.0) != model.predict(4.0)
    assert (model.slope, model.intercept) == before


@pytest.mark.parametrize("examples", [[], [(1.0, 1.0)], [(1.0, 2.0), (1.0, 3.0)],
                                      [(float("nan"), 1.0), (2.0, 3.0)],
                                      [(1.0, float("inf")), (2.0, 3.0)],
                                      [(True, 1.0), (2.0, 3.0)]])
def test_invalid_training_data(examples):
    with pytest.raises(ValueError):
        fit_linear(examples)


def test_inference_boundary():
    model = fit_linear([(1.0, 3.0), (2.0, 5.0)])
    for value in [float("inf"), True, 10001.0]:
        with pytest.raises(ValueError):
            model.predict(value)
