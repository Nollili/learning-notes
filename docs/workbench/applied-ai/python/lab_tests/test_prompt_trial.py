from study_ai.prompt_trial import synthetic_prompt_trial

def test_synthetic_metrics_are_exact():
 results=synthetic_prompt_trial();assert set(results)=={'synthetic-guesser','synthetic-careful','synthetic-silent'}
 guesser=results['synthetic-guesser'];assert (guesser.total,guesser.answered,guesser.correct,guesser.unsupported)==(4,4,2,2)
 assert guesser.coverage==1 and guesser.selective_accuracy==0.5
 careful=results['synthetic-careful'];assert (careful.total,careful.answered,careful.correct,careful.unsupported)==(4,2,2,0)
 assert careful.coverage==0.5 and careful.selective_accuracy==1
 silent=results['synthetic-silent'];assert silent.coverage==0 and silent.selective_accuracy is None
