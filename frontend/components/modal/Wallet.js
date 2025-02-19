import React from "react";
import styles from "./Wallet.module.css"

// function after button click here 

const handleclick = ()=>{
  alert("connect wallet clicked")
}

const Wallet = () => {
  return <> 
      <div >
        <button className={styles.button} onClick={handleclick}> CONNECT &rarr; </button>
        {/* <button class="button">Button</button> */}
      </div>
  </>
};

export default Wallet;
