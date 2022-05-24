<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220418091605 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE INDEX identifier_idx ON editions (identifier)');
        $this->addSql('CREATE INDEX identifier_idx ON roles (identifier)');
        $this->addSql('CREATE INDEX identifier_idx ON teams (identifier)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX identifier_idx ON editions');
        $this->addSql('DROP INDEX identifier_idx ON roles');
        $this->addSql('DROP INDEX identifier_idx ON teams');
    }
}
