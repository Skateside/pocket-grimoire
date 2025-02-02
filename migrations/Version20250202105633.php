<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250202105633 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE editions RENAME INDEX identifier_idx TO editions_identifier_idx');
        $this->addSql('ALTER TABLE roles ADD special JSON NOT NULL');
        $this->addSql('ALTER TABLE roles RENAME INDEX identifier_idx TO roles_identifier_idx');
        $this->addSql('ALTER TABLE teams RENAME INDEX identifier_idx TO teams_identifier_idx');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE editions RENAME INDEX editions_identifier_idx TO identifier_idx');
        $this->addSql('ALTER TABLE teams RENAME INDEX teams_identifier_idx TO identifier_idx');
        $this->addSql('ALTER TABLE roles DROP special');
        $this->addSql('ALTER TABLE roles RENAME INDEX roles_identifier_idx TO identifier_idx');
    }
}
