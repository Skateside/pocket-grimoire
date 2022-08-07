<?php

namespace App\Entity;

use App\Repository\HomebrewRepository;
use Doctrine\ORM\Mapping as ORM;

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

 /**
  * @ORM\Table(name="homebrew", indexes={@ORM\Index(name="uuid_idx", columns={"uuid"})})
  * @ORM\Entity(repositoryClass=HomebrewRepository::class)
  */
class Homebrew
{

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(name="uuid", type="string", length=255)
     */
    private $uuid;

    /**
     * @ORM\Column(name="created", type="datetime")
     */
    private $created;

    /**
     * @ORM\Column(name="accessed", type="datetime")
     */
    private $accessed;

    /**
     * @ORM\Column(name="json", type="json")
     */
    private $json;

    /**
     * Exposes the UUID.
     *
     * @return string
     */
    public function getUuid(): string
    {
        return $this->uuid;
    }

    /**
     * Sets the UUID.
     *
     * @param  string $uuid
     * @return self
     */
    public function setUuid(string $uuid): self
    {
        $this->uuid = $uuid;
        return $this;
    }

    /**
     * Exposes the time that the record was created.
     *
     * @return DateTime
     */
    public function getCreated(): \DateTime
    {
        return $this->created;
    }

    /**
     * Sets the time that the record was created.
     *
     * @param  DateTime $created
     * @return self
     */
    public function setCreated(\DateTime $created): self
    {
        $this->created = $created;
        return $this;
    }

    /**
     * Exposes the time that the record was last accessed.
     *
     * @return DateTime
     */
    public function getAccessed(): \DateTime
    {
        return $this->accessed;
    }

    /**
     * Sets the time that the record was last accessed.
     *
     * @param  DateTime $accessed
     * @return self
     */
    public function setAccessed(\DateTime $accessed): self
    {
        $this->accessed = $accessed;
        return $this;
    }

    /**
     * Exposes the JSON.
     *
     * @return array
     */
    public function getJson(): array
    {
        return $this->json;
    }

    /**
     * Sets the JSON.
     *
     * @param  array $json
     * @return self
     */
    public function setJson(array $json): self
    {
        $this->json = $json;
        return $this;
    }

}
