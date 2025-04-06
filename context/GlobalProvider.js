import { onAuthStateChanged,signOut } from "firebase/auth";
import { createContext, useContext, useState, useEffect, children } from "react";
import { auth,db } from '../services/config.js';
import {doc, setDoc, getDoc} from 'firebase/firestore'

const GlobalContext = createContext();

export const useGlobalContext = () => useContext
(GlobalContext);

const GlobalProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if(currentUser) {
                setIsLoggedIn(true)
                setUser(currentUser);
                updateUserData(currentUser.uid) //
            } else{
                setUser(null)
                setIsLoggedIn(false)
            }
            setIsLoading(false);
        })
        // Cleanup the subscription on unmount
        return() => unsubscribe();

    }, []);

    const updateUserData = async (userId) => {
        try{
        const docRef = doc(db, 'users' ,userId)
        const docSnap = await getDoc(docRef)

        if(docSnap.exists()){
            let data = docSnap.data();
            let nationalityName = data.nationality?.name || ''; 
            setUser({
                ...user,username: data.username, userId: data.userId, email:data.email, nationality:nationalityName, interests:data.interests, profileImage:data.profileImage})
        } else {
            console.log('No such document!')
        }
    }catch(error) {
        console.error('Error fetching user data: ', error)
    }
    }

    const logout = async() => {
        try{
            await signOut(auth);
            setUser(null);
            setIsLoggedIn(false);
            return{success: true}
        }catch(e){
            return {success: false, msg:e.message, error: e}
        }
    }

    return(
        <GlobalContext.Provider
        value={{
            isLoggedIn,
            user,
            isLoading,
            logout, 
            updateUserData,
            setUser,
            setIsLoggedIn,
        }}
        >
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider