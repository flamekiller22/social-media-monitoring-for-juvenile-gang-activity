"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { addNewUser } from "@/app/actions";

function AddKeyword() {
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false)

    const addData = async (e) => {
        setLoading(true)
        e.target.innerText = "Loading..."
        try {
            const r = await addNewUser(userInput);
            if (r.success) {
                alert("Added to DB successfully. Scraping and processing will be completed in the background")
            } else {
                alert("Failed to add to DB.")
            }
        } catch (err) {
            console.error(err);
            alert("Failed to add to DB.");
        } finally {
            e.target.innerText = "Add User"
            setLoading(false)
        }
    }

    return (
        <div className="m-5">
            <main className="container flex flex-col items-center">
                <h1 className="text-xl mb-3">Add a new user to search for:</h1>
                <Input
                    title="User"
                    type="text"
                    style={{ maxWidth: "30rem" }}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
                <Button
                    className="mt-5"
                    type="submit"
                    disabled={loading}
                    onClick={(e) => addData(e)}
                >
                    Add User
                </Button>
            </main>
        </div>
    );
}

export default AddKeyword;
