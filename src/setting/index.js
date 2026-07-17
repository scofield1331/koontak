import { renderExpirationDatPanel } from './ExpirationDatePanel';
import { renderMarkupOptionPanel } from './MarkupOptionPanel';

fetch('../setting/setting-template.php?action=load')
    .then(res => res.json())
    .then(data => {
        window.inventoryListModel.load(data);
        renderExpirationDatPanel(data.setting, data.formats);
        renderMarkupOptionPanel(data.setting, data.formats);
    })