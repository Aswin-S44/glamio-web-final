import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { auth } from "../config/firebase";
import { googleSignInApi } from "../services/auth.service";

function GoogleSignIn() {
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const data = await googleSignInApi(idToken);

      localStorage.setItem("token", data.data.token);
    } catch (error) {
      console.error("Google sign-in failed", error);
    }
  };

  return (
    <div className="screens" style={{ marginTop: "200px" }}>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>;
    </div>
  );
}

export default GoogleSignIn;
