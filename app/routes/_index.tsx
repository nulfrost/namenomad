import { generateText } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { races } from "~/constants";
import { useState } from "react";

const CharacterSchema = z.object({
  race: z.string(),
  class: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const result = CharacterSchema.safeParse(Object.fromEntries(formData));

    if (result.error) {
      return json(
        { error: "Please select a character and a class!", suggestions: null },
        { status: 400 },
      );
    }

    const suggestions = await generateText({
      model: openai("gpt-3.5-turbo"),
      system:
        "You're a world of warcraft name generating system. You have knowledge of the world of warcraft universe and its lore. Based on the character race and character class combination provided by a user, you will use your knowledge to help them come up with character names. The names should be appropriate for the character class and race. Just respond with a list of names and nothing else.",
      prompt: `I am a returning player to world of warcraft. I've decided I want to play as a ${result.data.race} ${result.data.class}. I need help coming up with a name for this character, can you generate 10 names for me?`,
    });

    return json({ error: null, suggestions });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message, suggestions: null }, { status: 500 });
    }
  }
}

export default function Index() {
  const data = useActionData<typeof action>();
  const [selectedRace, setSelectedRace] = useState("");
  return (
    <div>
      <h1>namenomad</h1>
      <div>{JSON.stringify(data?.suggestions?.text, null, 2)}</div>
      <Form method="POST">
        <fieldset>
          <legend>race</legend>
          {races.map((race) => (
            <>
              <div key={race.name}>
                <input
                  type="radio"
                  required
                  name="race"
                  id={race.name}
                  onChange={(event) => setSelectedRace(event.target.value)}
                  value={race.name}
                />
                <label htmlFor={race.name}>{race.name}</label>
              </div>
            </>
          ))}
          {data && data.error ? (
            <div role="alert" aria-live="assertive">
              {data.error}
            </div>
          ) : null}
        </fieldset>
        {selectedRace !== "" ? (
          <fieldset>
            <legend>class</legend>
            {races
              .find((race) => race.name === selectedRace)
              ?.available_classes.map((c) => (
                <div key={c}>
                  <input type="radio" name="class" id={c} value={c} />
                  <label htmlFor={c}>{c}</label>
                </div>
              ))}
          </fieldset>
        ) : null}
        <button type="submit">Generate character names</button>
      </Form>
    </div>
  );
}
