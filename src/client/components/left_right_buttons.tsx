import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

type propType = {
    onLeftLeft?: () => void;
    onLeft: () => void;
    onRight: () => void;
    onRightRight?: () => void;
};

export default function LeftRightButtons({ onLeftLeft, onLeft, onRight, onRightRight }: propType) {
    return <>
        <ButtonGroup className="ms-2 mb-2">
            <SmallButton text="⟪" onClick={onLeftLeft} />
            <SmallButton text="⟨" onClick={onLeft} />
            <SmallButton text="⟩" onClick={onRight} />
            <SmallButton text="⟫" onClick={onRightRight} />
        </ButtonGroup>
    </>;
}

function SmallButton({ text, onClick }: { text: string, onClick?: () => void }) {
    if (onClick) return <>
        <Button variant="light" size="sm" className="text-muted" onClick={onClick}>
            {text}
        </Button>
    </>;
}
