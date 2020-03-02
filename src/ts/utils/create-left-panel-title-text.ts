export function createLeftPanelTitleText(
    position: { height: number; left: number; width: number; },
    sentence: string,
    border: string,
    color: string
): HTMLElement {
    const element = document.createElement('div');
    element.id = 'left-panel-title-text';
    element.style.fontFamily = 'Luckiest Guy';
    element.style.color = color;
    element.style.position = 'absolute';
    element.style.maxWidth = `${0.43 * position.width}px`;
    element.style.width = `${0.43 * position.width}px`;
    element.style.maxHeight = `${0.08 * position.height}px`;
    element.style.height = `${0.08 * position.height}px`;
    element.style.backgroundColor = 'transparent';
    element.innerHTML = sentence;
    element.style.top = `${0.01 * position.height}px`;
    element.style.left = `${position.left + (0.02 * position.width)}px`;
    element.style.overflowY = 'hidden';
    element.style.textAlign = 'center';
    element.style.fontSize = `${0.03 * position.width}px`;
    element.style.border = border;
    document.body.appendChild(element);
    return element;
}