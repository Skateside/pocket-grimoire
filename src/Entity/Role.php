<?php

namespace App\Entity;

use App\Repository\RoleRepository;
use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Table(name="roles", indexes={@ORM\Index(name="identifier_idx", columns={"identifier"})})
 * @ORM\Entity(repositoryClass=RoleRepository::class)
 */
class Role
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
     * @ORM\Column(name="name", type="string", length=255, options={"default": ""})
     */
    private $name = '';

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Edition", inversedBy="roles")
     */
    private $edition = null;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Team", inversedBy="roles")
     */
    private $team = null;

    /**
     * @ORM\Column(name="first_night", type="integer", options={"default": 0})
     */
    private $firstNight = 0;

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="first_night_reminder", type="text", options={"default": ""})
     */
    private $firstNightReminder = '';

    /**
     * @ORM\Column(name="other_night", type="integer", options={"default": 0})
     */
    private $otherNight = 0;

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="other_night_reminder", type="text", options={"default": ""})
     */
    private $otherNightReminder = '';

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="reminders", type="array")
     */
    private $reminders = [];

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="reminders_global", type="array")
     */
    private $remindersGlobal = [];

    /**
     * @ORM\Column(name="setup", type="boolean", options={"default": false})
     */
    private $setup = false;

    /**
     * @Gedmo\Translatable
     * @ORM\Column(name="ability", type="text", options={"default": ""})
     */
    private $ability = '';

    /**
     * @ORM\Column(name="image", type="string", length=255, options={"default": ""})
     */
    private $image = '';

    /**
     * @Gedmo\Locale
     * Used locale to override Translation listener`s locale.
     * This is not a mapped field of entity metadata, just a simple property.
     */
    private $locale;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Jinx", mappedBy="target")
     */
    private $jinxes;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Jinx", mappedBy="trick")
     */
    private $tricks;

    /**
     * @ORM\Column(name="special", type="json")
     */
    private $special = [];

    public function __construct()
    {
        $this->jinxes = new ArrayCollection();
        $this->tricks = new ArrayCollection();
    }

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
     * Sets the edition, which can be null.
     *
     * @param  ?Edition $edition
     * @return self
     */
    public function setEdition(?Edition $edition): self
    {
        $this->edition = $edition;
        return $this;
    }

    /**
     * Exposes the edition, which can be null.
     *
     * @return ?Edition
     */
    public function getEdition(): ?Edition
    {
        return $this->edition;
    }

    /**
     * Sets the team.
     *
     * @param  Team $team
     * @return self
     */
    public function setTeam(Team $team): self
    {
        $this->team = $team;
        return $this;
    }

    /**
     * Exposes the team, which may be null if a team hasn't been set yet.
     *
     * @return ?Team
     */
    public function getTeam(): ?Team
    {
        return $this->team;
    }

    /**
     * Sets the first night order value.
     *
     * @param  int  $firstNight
     * @return self
     */
    public function setFirstNight(int $firstNight): self
    {
        $this->firstNight = $firstNight;
        return $this;
    }

    /**
     * Exposes the first night order value.
     *
     * @return int
     */
    public function getFirstNight(): int
    {
        return $this->firstNight;
    }

    /**
     * Sets the first night reminder text.
     *
     * @param  string $firstNightReminder
     * @return self
     */
    public function setFirstNightReminder(string $firstNightReminder): self
    {
        $this->firstNightReminder = $firstNightReminder;
        return $this;
    }

    /**
     * Exposes the first night reminder text.
     *
     * @return string
     */
    public function getFirstNightReminder(): string
    {
        return $this->firstNightReminder;
    }

    /**
     * Sets the other night order value.
     *
     * @param  int  $otherNight
     * @return self
     */
    public function setOtherNight(int $otherNight): self
    {
        $this->otherNight = $otherNight;
        return $this;
    }

    /**
     * Exposes the other night order value.
     *
     * @return int
     */
    public function getOtherNight(): int
    {
        return $this->otherNight;
    }

    /**
     * Sets the other night reminder text.
     *
     * @param  string $otherNightReminder
     * @return self
     */
    public function setOtherNightReminder(string $otherNightReminder): self
    {
        $this->otherNightReminder = $otherNightReminder;
        return $this;
    }

    /**
     * Exposes the other night reminder text.
     *
     * @return string
     */
    public function getOtherNightReminder(): string
    {
        return $this->otherNightReminder;
    }

    /**
     * Sets the reminders.
     *
     * @param  array $reminders
     * @return self
     */
    public function setReminders(array $reminders): self
    {
        $this->reminders = $reminders;
        return $this;
    }

    /**
     * Exposes the reminders, which may be an empty array.
     *
     * @return array
     */
    public function getReminders(): array
    {
        return $this->reminders;
    }

    /**
     * Sets the global reminders.
     *
     * @param  array $reminders
     * @return self
     */
    public function setRemindersGlobal(array $remindersGlobal): self
    {
        $this->remindersGlobal = $remindersGlobal;
        return $this;
    }

    /**
     * Exposes the global reminders, which may be an empty array.
     *
     * @return array
     */
    public function getRemindersGlobal(): array
    {
        return $this->remindersGlobal;
    }

    /**
     * Sets whether or not there is any setup required for this role.
     *
     * @param  bool $setup
     * @return self
     */
    public function setSetup(bool $setup): self
    {
        $this->setup = $setup;
        return $this;
    }

    /**
     * Exposes whether or not there is any setup required for this role.
     *
     * @return bool
     */
    public function getSetup(): bool
    {
        return $this->setup;
    }

    /**
     * Sets the ability text.
     *
     * @param  string $ability
     * @return self
     */
    public function setAbility(string $ability): self
    {
        $this->ability = $ability;
        return $this;
    }

    /**
     * Exposes the ability text.
     *
     * @return string
     */
    public function getAbility(): string
    {
        return $this->ability;
    }

    /**
     * Sets the URL of the role's image.
     *
     * @param  string $image
     * @return self
     */
    public function setImage(string $image): self
    {
        $this->image = $image;
        return $this;
    }

    /**
     * Exposes the URL of the role's image, which may be an empty string.
     *
     * @return string
     */
    public function getImage(): string
    {
        return $this->image;
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
     * Adds a jinx.
     *
     * @param  Jinx $jinx
     * @return self
     */
    public function addJinx(Jinx $jinx): self
    {
        $this->jinxes[] = $jinx;
        return $this;
    }

    /**
     * Removes a jinx.
     *
     * @param  Jinx $jinx
     * @return bool
     */
    public function removeJinx(Jinx $jinx): bool
    {
        return $this->jinxes->removeElement($jinx);
    }

    /**
     * Exposes all the jinxes for this edition.
     *
     * @return Collection
     */
    public function getJinxes(): Collection
    {
        return $this->jinxes;
    }

    /**
     * Adds a trick.
     *
     * @param  Jinx $trick
     * @return self
     */
    public function addTrick(Jinx $trick): self
    {
        $this->tricks[] = $trick;
        return $this;
    }

    /**
     * Removes a trick.
     *
     * @param  Jinx $trick
     * @return bool
     */
    public function removeTrick(Jinx $trick): bool
    {
        return $this->tricks->removeElement($trick);
    }

    /**
     * Exposes all the trickes for this edition.
     *
     * @return Collection
     */
    public function getTrickes(): Collection
    {
        return $this->tricks;
    }

    /**
     * Sets the special rules for this role.
     *
     * @param  array $special
     * @return self
     */
    public function setSpecial(array $special): self
    {
        $this->special = $special;
        return $this;
    }

    /**
     * Exposes the special rules.
     *
     * @return array
     */
    public function getSpecial(): ?array
    {
        return $this->special;
    }

}
