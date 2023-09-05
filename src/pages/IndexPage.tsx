import { setEnvironment } from "pocket";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function IndexPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setEnvironment('browser');
        navigate('/login?' + params.toString());
    }, [navigate]);

    return <div>

    </div>
}

export default IndexPage;