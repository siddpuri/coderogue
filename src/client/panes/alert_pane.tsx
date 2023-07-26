export default function AlertPane() {
    return (
        <div className="position-fixed start-0 end-0 bottom-0 clickthrough">
            <div className="alert fade px-4 pt-1 pb-1 mb-0" id="message" />
        </div>
    );
}
