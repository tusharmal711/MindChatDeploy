import { useState } from "react";



const Dash = () =>{
    const [popup,setPopup]=useState(false);
    return(
        <div>
             <button onClick={()=>{setPopup(true)}}>Submit</button>
             {
                popup && (
                    <div>
                    <p>This is popup box</p>
                    <button onClick={()=>{setPopup(false)}}>okk</button>
                    </div>
                )
             }
             </div>

    );

}
export default Dash;