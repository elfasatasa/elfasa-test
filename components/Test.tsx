'use client'

import { useState } from "react"
import data from "../data/physics.json"

export default function Test () {

    const [tests,setTests] = useState<IPhysics[]>(data)
    return (
        <div>
            <h3>Tests</h3>
            <br />
            {tests.map(test => (<div key={test.id}>{test.question} <br /></div>))}
        </div>
    )
}