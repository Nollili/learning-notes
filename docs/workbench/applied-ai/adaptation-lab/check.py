from concepts import authorized_neighbours,training_splits,best_checkpoint

def test_graph_acl_cycle_and_bounds():
    edges=[('a','b','s1'),('b','c','s2'),('c','a','s3'),('a','x','foreign'),('x','d','hidden-path')]
    assert authorized_neighbours('a',edges,{'a','b','c','d'})==[('b','s1'),('c','s2')]
    assert authorized_neighbours('a',edges,{'b','c'})==[]
    assert authorized_neighbours('a',edges,{'a','b','c'},1)==[('b','s1')]
def test_group_split_and_duplicate_detection():
    data=[{'group':f'family-{i//2}','input':f'example {i}','output':'backend'}for i in range(100)]
    splits=training_splits(data)
    groups={key:{r['group']for r in rows}for key,rows in splits.items()}
    assert not(groups['train']&groups['test']or groups['train']&groups['validation']or groups['test']&groups['validation'])
    assert sum(map(len,splits.values()))==100
    try:training_splits([*data,dict(data[0],group='other')])
    except ValueError:pass
    else:raise AssertionError('leakage accepted')
def test_checkpoint_is_validation_selected():
    assert best_checkpoint([0.5,0.4,0.45])==2
    try:best_checkpoint([float('nan')])
    except ValueError:pass
    else:raise AssertionError('NaN accepted')
