const ForgotPassword = ()=>{
   return (
    <div>
           <div className="forgotPassword">
                 <form>
                      <div className="input-field">
                        <input type="email" className="remail" placeholder="Enter your registered email id..." required />
                      </div>
                       <div className="input-field">
                        <button className="fpbutton">Send Otp</button>
                      </div>
                 </form>
           </div>
    </div>
   )
}
export default ForgotPassword;