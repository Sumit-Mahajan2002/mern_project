import {create} from  "zustand";
import toast from  "react-hot-toast";
import {axiosInstance} from "../lib/axios";

export const useChatStore = create((set) =>({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false, 

    getUsers: async () => {
        set({ isUsersLoading: true});
        // console.log("isUserLoading" ,{isUserLoading})
        try{
            const res = await axiosInstance.get("/messages/users");
            console.log("Users Response:", res.data);

            set({users: res.data[0],isUserLoading : false });

        } catch (error){
            toast.error(error.response.data.messages);
            set({ isUserLoading : false});

        }
        // } finally {
        //     set({ isUserLoading : false});

        // }
        
    },
    getMessages: async(userId) => {
        set({isMessageLoading : true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});

        } catch (error){
            toast.error(error.response.data.message);

        } finally{
            set({isMessageLoading: false});
            
        }
    },



    setSelectedUser: (selectedUser) => set({ selectedUser }),


}))