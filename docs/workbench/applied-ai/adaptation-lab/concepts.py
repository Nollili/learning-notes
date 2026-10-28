import hashlib
import math
from collections import deque

def authorized_neighbours(root, edges, allowed, max_hops=2):
    # Application-owned small synthetic graph; allowed is a current trusted ACL snapshot.
    if type(max_hops) is not int or not 0 <= max_hops <= 2 or len(edges)>100:
        raise ValueError('Traversal budget')
    if root not in allowed:
        return []
    queue=deque([(root,0)]);seen={root};result=[]
    while queue:
        node,depth=queue.popleft()
        if depth==max_hops:
            continue
        for source,target,span in edges:
            if source==node and target in allowed and target not in seen:
                seen.add(target);result.append((target,span));queue.append((target,depth+1))
    return result

def training_splits(examples):
    if not 3 <= len(examples) <= 10000:
        raise ValueError('Dataset count')
    result={'train':[],'validation':[],'test':[]};seen={}
    for row in examples:
        if type(row) is not dict or set(row)!={'group','input','output'} or any(type(row[k]) is not str or not 1 <= len(row[k]) <= 8192 for k in row):
            raise ValueError('Dataset schema')
        identity=hashlib.sha256(row['input'].encode('utf-8')).hexdigest()
        if identity in seen:
            raise ValueError('Duplicate input: review family/labels before splitting')
        seen[identity]=row['group']
        bucket=int(hashlib.sha256(row['group'].encode()).hexdigest(),16)%10
        split='test' if bucket==0 else 'validation' if bucket==1 else 'train'
        result[split].append(dict(row))
    if any(not rows for rows in result.values()):
        raise ValueError('Need more independent groups for all splits')
    return result

def best_checkpoint(validation_losses):
    if not validation_losses or any(type(v) not in (int,float) or not math.isfinite(v) or v<0 for v in validation_losses):
        raise ValueError('Invalid validation loss')
    return min(range(len(validation_losses)),key=lambda i:validation_losses[i])+1
