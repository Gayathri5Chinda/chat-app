import { Quote } from "../components/Quote";
import { Auth } from "../components/Auth";

export const SignupPage = () => {
    return <div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div>
                <Auth type={"signup"}/>
            </div>
            <div className="hidden lg:block">
               <Quote/>
            </div>
        </div>
    </div>
}
