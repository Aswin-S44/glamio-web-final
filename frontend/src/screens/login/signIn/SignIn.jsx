import React, { useState } from "react";
import "./SignIn.css";
import GoogleImg from "../../../components/Media/Images/google.png";
import AppleImg from "../../../components/Media/Images/apple.png";
import signInImg from "../../../components/Media/Images/signInImg.webp";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../../../config/firebase";
import { googleSignInApi } from "../../../services/auth.service";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";

function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminSignIn = () => {
    if (email === "admin@gmail.com" && password === "admin") {
      const adminData = {
        email: "admin@gmail.com",
        role: "ADMIN",
        isAdminLoggedIn: true,
      };

      localStorage.setItem("admin", JSON.stringify(adminData));
      localStorage.setItem("isAdminLoggedIn", "true");

      navigate("/shop/dashboard");
      return;
    }

    alert("Invalid credentials");
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const data = await googleSignInApi(idToken);

      localStorage.setItem("token", data.data.token);
      // navigate("/shop/dashboard");
      let user = data.data.user;

      let userType = "CUSTOMER";

      let userData = {
        email: user.email,
        username: user.name,
        profileImage: user.picture,
        userType,
      };

      const res = await fetch("http://localhost:5000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      // const createdUser = await res.json();
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <>
      {" "}
      <Header />
      <div className="signIn">
        <div className="container">
          <div className="row d-flex align-items-center justify-content-center">
            <div className="col-md-6">
              <img
                src={signInImg}
                style={{ width: "100%", height: "100%" }}
                className="signInImg"
              />
            </div>
            <div className="col-md-6">
              <form class="form">
                <div class="flex-column">
                  <label>Email </label>
                </div>
                <div class="inputForm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    viewBox="0 0 32 32"
                    height="20"
                  >
                    <g data-name="Layer 3" id="Layer_3">
                      <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                    </g>
                  </svg>
                  <input
                    placeholder="Enter your Email"
                    class="input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div class="flex-column">
                  <label>Password </label>
                </div>
                <div class="inputForm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    viewBox="-64 0 512 512"
                    height="20"
                  >
                    <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                    <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
                  </svg>
                  <input
                    placeholder="Enter your Password"
                    class="input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div class="flex-row">
                  <div>
                    <input type="radio" />
                    <label style={{ paddingLeft: "10px" }}>Remember me </label>
                  </div>
                  <span class="span">Forgot password?</span>
                </div>
                <div class="button-submit" onClick={handleAdminSignIn}>
                  Sign In
                </div>
                <p class="p">
                  Don't have an account? <span class="span">Sign Up</span>
                </p>
                <p class="p line">Or With</p>
                <div class="flex-row">
                  <div onClick={handleGoogleSignIn} class="btn google">
                    <img
                      src={GoogleImg}
                      style={{ width: "auto%", height: "30px" }}
                    />
                    Google
                  </div>
                  <div class="btn apple">
                    <img
                      src={AppleImg}
                      style={{ width: "auto%", height: "30px" }}
                    />
                    Apple
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default SignIn;
