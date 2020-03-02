export function createRightPanelText(
    position: { height: number; left: number; width: number; },
    sentence: string,
    border: string,
    color: string
): HTMLElement {
    const element = document.createElement('div');
    element.id = 'dialogue-text';
    element.style.fontFamily = 'Luckiest Guy';
    element.style.color = color;
    element.style.position = 'absolute';
    element.style.maxWidth = `${0.25 * position.width}px`;
    element.style.width = `${0.25 * position.width}px`;
    element.style.maxHeight = `${0.24 * position.height}px`;
    element.style.height = `${0.24 * position.height}px`;
    element.style.backgroundColor = 'transparent';
    element.innerHTML = sentence;
    element.style.top = `${0.01 * position.height}px`;
    element.style.left = `${position.left + (0.5 * position.width)}px`;
    element.style.overflowY = 'hidden';
    element.style.fontSize = `${0.017 * position.width}px`;
    element.style.border = border;
    document.body.appendChild(element);
    return element;
}