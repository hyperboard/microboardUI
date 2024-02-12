import { useState } from 'react';
import Cookies from "js-cookie";

export const useAuth = (): boolean => {
    let value = false;
    try {
        if (Cookies.get("accessToken") !== "") {
            value = true
        }
    } catch (err) {
        value = false;
    }
    return value;
}