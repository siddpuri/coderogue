import { Button } from 'react-bootstrap';

type propType = {
    text: string;
    onClick: () => void;
};

export default function SimpleButton({ text, onClick }: propType) {
    return <>
        <Button variant="secondary" onClick={onClick}>
            {text}
        </Button>
    </>;
}