import { generateText } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { races } from "~/constants";
import { Button, Autocomplete, Container, List, Title } from "@mantine/core";
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
      model: openai("gpt-4o"),
      system:
        "You're a world of warcraft character name generating system. You have knowledge of the world of warcraft universe and its lore. Based on the character race and character class combination provided by a user, you will use your knowledge to help them come up with character names. The names should fit the fantasy of an online MMORPG game as well as the class combination. Stay clear of the generic names that are used within world of warcraft and try and come up with new names. The generated names must not exceed 12 characters. Just return the names without any additional information. Remove special characters as well. Do not use any names that are trademarked or copyrighted. Do not use any character names that exist in the game as NPCs. Do not use any names that are offensive or inappropriate. Return a comma separated list and nothing else.",
      prompt: `I am a returning player to world of warcraft. I've decided I want to play as a ${result.data.race} ${result.data.class}. I need help coming up with a name for this character, can you generate 20 names for me?`,
    });

    return json({ error: null, suggestions });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message, suggestions: null }, { status: 500 });
    }

    return json(
      { error: "Unknown error.", suggestions: null },
      { status: 500 },
    );
  }
}

export default function Index() {
  const data = useActionData<typeof action>();
  const [selectedRace, setSelectedRace] = useState("");
  console.log(data?.suggestions?.text);
  return (
    <Container w={500}>
      <Title order={1}>namenomad</Title>
      <Form method="POST" style={{ marginBottom: "3rem" }}>
        <Autocomplete
          data={races.map((race) => race.name)}
          label="Select a race"
          name="race"
          id="race"
          mb={20}
          onChange={(value) => {
            setSelectedRace(value);
          }}
          placeholder="start typing or click to select a value from the list"
          error={data?.error ? data.error : undefined}
          comboboxProps={{
            transitionProps: { transition: "pop", duration: 200 },
          }}
        />
        {selectedRace !== "" ? (
          <Autocomplete
            name="class"
            id="class"
            data={races
              .find((race) => race.name === selectedRace)
              ?.available_classes.map((c) => c)}
            label="Select a class"
            mb={10}
            placeholder="start typing or click to select a value from the list"
            error={data?.error ? data.error : undefined}
            comboboxProps={{
              transitionProps: { transition: "pop", duration: 200 },
            }}
          />
        ) : null}
        <Button type="submit">Generate character names</Button>
      </Form>
      <div aria-live="polite" aria-atomic>
        <Title order={2} size="h3">
          Suggested names for your character
        </Title>
        <List type="ordered" size="lg">
          {data?.suggestions?.text
            .split(",")
            .map((suggestion, index) => (
              <List.Item key={index}>{suggestion}</List.Item>
            ))}
        </List>
      </div>
    </Container>
  );
}
