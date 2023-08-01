import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import pocket, { setDefaultDbName } from "pocket";
import router from "./router";
import general from "@nix/general";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { User } from "./models/User";
import uac from "@nix/uac";
import { getSynker } from './core/sync.flow';
import { AxiosError } from "axios";
import { logout } from "./core/auth.flow";

const LOCAL_DATABASE_NAME = process.env.REACT_APP_LOCAL_DATABASE_NAME as string;
setDefaultDbName(LOCAL_DATABASE_NAME);

declare const window: Window &
    typeof globalThis & {
        REMOTE_HOST: string;
        REMOTE_PASSWORD: string;

        API_HOST: string;
    };
window.API_HOST = process.env.REACT_APP_API_HOST || "";
general.api.host.setApiHost(window.API_HOST);

pocket().then(async () => {
    general.api.host.setNixErrorCallback(async (error) => {
        const ACCESS_TOKEN_EXPIRED = 'Access token expired, please use refresh token to get a new one';
        if (error instanceof AxiosError) {
            const { response } = error;
            if (!response) return;
            const message = response.data.message;
            if (message === ACCESS_TOKEN_EXPIRED) {
                try {
                    const user = await User.first();
                    const response = await uac.api.auth.refresh(user?.refreshToken || '');
                    if (response) {
                        const localUser = (await User.first()) || new User();
                        localUser.refreshToken = response.refreshToken;
                        await localUser.save();
                    }
                } catch (error) {
                    await logout();
                    window.location.href = '/';
                    return;
                }
            }
        }
    });

    User.first().then(async (user) => {
        if (user) {
            if (user?.nixId) {
                await getSynker(user?.nixId);
            }
        }
    });

    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement
    );
    root.render(
        <GoogleOAuthProvider
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ""}
        >
            <RouterProvider router={router} />
        </GoogleOAuthProvider>
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
});
