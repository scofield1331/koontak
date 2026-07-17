import { createLeftTopElement } from "./left-top";
import { createList } from "./list";

export function createLeftElement(props) {
    const list = createList(props);
    const element = document.createElement('div');
    element.className = 'col-md-3 left-sticky';
    element.appendChild(createLeftTopElement(props));
    element.appendChild(list);

    element.updateList = (props) => {
        list.update(props);
    }
    element.insert = (props) => {
        list.insert(props);
    }
    return element;
}