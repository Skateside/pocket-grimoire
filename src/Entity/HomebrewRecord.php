<?php

/*
We can store the custom JSON in this table, making it easy for other people to
access the data (for the character sheet). If we update the date whenever it's
accessed, we can delete anything that hasn't been used for more than 10 days
(for example).

We can validate the JSON in the Repository so we know that it's all good.

We can set a flag in the JSON so that we know we need to look up information for
an existing role:

[
    { "id": "washerwoman", "homebrew": true },
    { "id": "...", "homebrew": false, "name": "...", "ability": "...", "image": "..." }
]

The UUID will be the identifier that gets the JSON data. The URL of the sheet
will become:
/sheet?game=XXX
 */

class HomebrewRecord
{

    private $id;
    private $uuid;
    private $created;
    private $accessed;
    private $json;

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function setUuid(string $uuid): self
    {
        $this->uuid = $uuid;
        return $this;
    }

    public function getCreated(): \DateTime
    {
        return $this->created;
    }

    public function setCreated(\DateTime $created): self
    {
        $this->created = $created;
        return $this;
    }

    public function getAccessed(): \DateTime
    {
        return $this->accessed;
    }

    public function setAccessed(\DateTime $accessed): self
    {
        $this->accessed = $accessed;
        return $this;
    }

    public function getJson(): array
    {
        return $this->json;
    }

    public function setJson(array $json): self
    {
        $this->json = $json;
        return $this;
    }

}
