<?php

namespace App\Entity;

use App\Repository\TeamRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Table(name="teams", indexes={@ORM\Index(name="identifier_idx", columns={"identifier"})})
 * @ORM\Entity(repositoryClass=TeamRepository::class)
 */
class Team
{

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(name="identifier", type="string", length=255)
     */
    private $identifier;

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="name", type="string", length=255)
     */
    private $name;

    /**
     * @Gedmo\Locale
     * Used locale to override Translation listener`s locale.
     * This is not a mapped field of entity metadata, just a simple property.
     */
    private $locale;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Role", mappedBy="team")
     */
    private $roles;

    public function __construct()
    {
        $this->roles = new ArrayCollection();
    }

    /**
     * Expose the ID.
     *
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Sets the identifier.
     *
     * @param  string $identifier
     * @return self
     */
    public function setIdentifier(string $identifier): self
    {
        $this->identifier = $identifier;
        return $this;
    }

    /**
     * Exposes the identifier.
     *
     * @return string
     */
    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    /**
     * Sets the team name.
     *
     * @param  string $name
     * @return self
     */
    public function setName(string $name): self
    {
        $this->name = $name;
        return $this;
    }

    /**
     * Exposes the team name.
     *
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * Sets the locale.
     */
    public function setTranslatableLocale(string $locale): self
    {
        $this->locale = $locale;
        return $this;
    }

    /**
     * Adds a role.
     *
     * @param  Role $role
     * @return self
     */
    public function addRole(Role $role): self
    {
        $this->roles[] = $role;
        return $this;
    }

    /**
     * Removes a role.
     *
     * @param  Role $role
     * @return bool
     */
    public function removeRole(Role $role): bool
    {
        return $this->roles->removeElement($role);
    }

    /**
     * Exposes all the roles for this edition.
     *
     * @return Collection
     */
    public function getRoles(): Collection
    {
        return $this->roles;
    }

}
