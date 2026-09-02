<?php

namespace App\Entity;

use App\Repository\DrawSessionRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Table(name="draw_sessions", indexes={
 *     @ORM\Index(name="draw_sessions_uuid_idx", columns={"uuid"}),
 *     @ORM\Index(name="draw_sessions_expires_at_idx", columns={"expires_at"})
 * })
 * @ORM\Entity(repositoryClass=DrawSessionRepository::class)
 */
class DrawSession
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
     * @ORM\Column(name="expires_at", type="datetime", nullable=true)
     */
    private $expiresAt;

    /**
     * @ORM\Column(name="slots", type="json")
     */
    private $slots = [];

    /**
     * Exposes the primary key.
     *
     * @return int|null
     */
    public function getId(): ?int
    {
        return $this->id;
    }

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
     * Exposes the creation time.
     *
     * @return \DateTime
     */
    public function getCreated(): \DateTime
    {
        return $this->created;
    }

    /**
     * Sets the creation time.
     *
     * @param  \DateTime $created
     * @return self
     */
    public function setCreated(\DateTime $created): self
    {
        $this->created = $created;
        return $this;
    }

    /**
     * Exposes the expiry time, if one has been set.
     *
     * @return \DateTime|null
     */
    public function getExpiresAt(): ?\DateTime
    {
        return $this->expiresAt;
    }

    /**
     * Sets the expiry time.
     *
     * @param  \DateTime|null $expiresAt
     * @return self
     */
    public function setExpiresAt(?\DateTime $expiresAt): self
    {
        $this->expiresAt = $expiresAt;
        return $this;
    }

    /**
     * Exposes all draw slots.
     *
     * @return array
     */
    public function getSlots(): array
    {
        return $this->slots;
    }

    /**
     * Sets all draw slots.
     *
     * @param  array $slots
     * @return self
     */
    public function setSlots(array $slots): self
    {
        $this->slots = $slots;
        return $this;
    }

    /**
     * Checks whether the draw session has expired.
     *
     * @return bool
     */
    public function isExpired(): bool
    {
        return $this->expiresAt && $this->expiresAt <= new \DateTime();
    }

}
