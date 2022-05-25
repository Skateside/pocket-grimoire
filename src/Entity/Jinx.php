<?php

namespace App\Entity;

use App\Repository\JinxRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Table(name="jinxes")
 * @ORM\Entity(repositoryClass=JinxRepository::class)
 */
class Jinx
{

    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Role", inversedBy="jinxes")
     */
    private $target;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Role", inversedBy="tricks")
     */
    private $trick;

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="reason", type="text", options={"default": ""})
     */
    private $reason = '';

    /**
     * @Gedmo\Locale
     * Used locale to override Translation listener`s locale.
     * This is not a mapped field of entity metadata, just a simple property.
     */
    private $locale;

    /**
     * @var bool
     * Not mapped to any field, used to work out if the jinx should appear on
     * the character sheet.
     */
    private $active = false;

    /**
     * Exposes the ID.
     *
     * @return int
     */
    public function getId(): int
    {
        return $this->id;
    }

    /**
     * Sets the target of the Jinx. A Jinx's target is the role that has the
     * jinx - the larger icon in the character sheet.
     *
     * @param  Role $role
     * @return self
     */
    public function setTarget(Role $role): self
    {
        $this->target = $role;
        return $this;
    }

    /**
     * Exposes the jinx's target.
     *
     * @return Role
     */
    public function getTarget(): Role
    {
        return $this->target;
    }

    /**
     * Sets the trick of the Jinx. A Jinx's trick is the role that the target is
     * jinxed with - the smaller icon in the character sheet.
     *
     * @param  Role $role
     * @return self
     */
    public function setTrick(Role $role): self
    {
        $this->trick = $role;
        return $this;
    }

    /**
     * Exposes the jinx's trick.
     *
     * @return Role
     */
    public function getTrick(): Role
    {
        return $this->trick;
    }

    /**
     * Sets the reason for the jinx.
     *
     * @param  string $reason
     * @return self
     */
    public function setReason(string $reason): self
    {
        $this->reason = $reason;
        return $this;
    }

    /**
     * Exposes the reason for the jinx.
     *
     * @return string
     */
    public function getReason(): string
    {
        return $this->reason;
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
     * Sets whether or not the jinx is active.
     *
     * @param bool $active
     * @return self
     */
    public function setActive(bool $active): self
    {
        $this->active = $active;
        return $this;
    }

    /**
     * Exposes whether or not the jinx is active.
     *
     * @return bool
     */
    public function getActive(): bool
    {
        return $this->active;
    }

}
