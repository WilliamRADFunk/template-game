export function createMinusButton(
    position: { height: number; left: number; width: number; },
    colors: { selectedColor: string, neutralColor: string; },
    visible: boolean) {
    const minusButton = document.createElement('button');
    minusButton.classList.add('fa', 'fa-minus');
    minusButton.id = 'minus-button';
    minusButton.style.outline = 'none';
    minusButton.style.backgroundColor = colors.selectedColor;
    minusButton.style.color = colors.neutralColor;
    minusButton.style.position = 'absolute';
    minusButton.style.maxWidth = `${0.06 * position.width}px`;
    minusButton.style.width = `${0.06 * position.width}px`;
    minusButton.style.maxHeight = `${0.06 * position.height}px`;
    minusButton.style.height = `${0.06 * position.height}px`;
    minusButton.style.top = `${0.15 * position.height}px`;
    minusButton.style.left = `${position.left + (0.02 * position.width)}px`;
    minusButton.style.overflowY = 'hidden';
    minusButton.style.textAlign = 'center';
    minusButton.style.border = '1px solid #FFD700';
    minusButton.style.borderRadius = '10px';
    minusButton.style.fontSize = `${0.022 * position.width}px`;
    minusButton.style.boxSizing = 'border-box';
    minusButton.style.visibility = visible ? 'visible' : 'hidden';
    document.body.appendChild(minusButton);
    return minusButton;
}