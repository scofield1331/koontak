
import { Registry } from '@/service/Registry';
import { Recipe } from '@/Object/Recipe';
import { Step } from '@/Object/Step';
import { createTotalRowElement } from './TotalRow';
import { calculateTotal } from './Utils';
window.Service = { Registry: new Registry() };
console.log('test', window.Service);
window.Model = { Recipe, Step };
window.Component = { createTotalRowElement };
window.Utils = { calculateTotal };