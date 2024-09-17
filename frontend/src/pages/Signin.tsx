import { Authentication } from "../component/Authentication"
import { Quote } from "../component/Quote"

export const Signin = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2">
            <div>
                <Authentication type="signin"/>
            </div>
            <div className="hidden lg:block">
                <Quote />
            </div>
        </div>
    )
}