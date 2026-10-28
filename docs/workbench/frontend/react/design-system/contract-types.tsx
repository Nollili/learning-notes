import { createRef } from 'react';
import { Button } from './Button';
const ref=createRef<HTMLButtonElement>();
const valid=<Button ref={ref} type="submit" variant="secondary" disabled={false}>Save</Button>;
// @ts-expect-error This API deliberately supports two variants.
const badVariant=<Button variant="danger">Save</Button>;
// @ts-expect-error Visible text children are the narrow component contract.
const badChildren=<Button><span>Save</span></Button>;
void [valid,badVariant,badChildren];
