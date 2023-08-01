import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function IndexPage() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/login');
    }, [navigate]);

    return <div>

    </div>
}

export default IndexPage;