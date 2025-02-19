import Link from "next/link";
import { useDisconnect } from "wagmi";

const Error = () => {
  const { disconnect } = useDisconnect();

  return (
    <>
      <div className="main">
      <font style={{
          fontSize:"100px",
          marginLeft:"45%"
          }}>&#128528; 
        </font>
        <br />
        <br />
    
        <div className="heading">
      
          <div className="error">404</div>
        </div>
    
        <p className="error"><b> Page not found ! </b> </p>
        <p>
          We can't seem to find the page you're looking for. Try going back to
          the previous page or check out our navigation bar or return to{" "}
          <big>Home Page</big> by clicking here.
        </p>
        <br />

        <Link
          href="/"
          style={{
            textDecoration: "none",
            border: "1px solid blue",
            borderRadius: "15px",
            padding: "20px",
            background: "blue",
            color: "white",
            fontSize: "22px",
            fontWeight:"bold",
            marginLeft: "47%",
          }}
          onClick={() => {
            disconnect();
          }}
        >
          Home
        </Link>

        {/* nextJs in-page styling */}

        <style jsx>
          {`
            .main {
              margin: 50px;
              position: absolute;
            }

            .heading {
              font-size: 100px;
              font-weight: bold;
              background: lightblue;
              color: white;
              text-aligns: center;
            }

            .error {
              margin-left: 45%;
            }

            p {
              font-size: 20px;
              // font-family: "Lucida Console", "Courier New", monospace;
              font-family: Verdana, sans-serif;
            }
          `}
        </style>
      </div>
    </>
  );
};

export default Error;
