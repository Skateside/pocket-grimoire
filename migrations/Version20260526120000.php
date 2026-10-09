<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260526120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create draw sessions for QR player draws';
    }

    public function up(Schema $schema): void
    {
        if ($this->connection->getDatabasePlatform()->getName() === 'postgresql') {
            $this->addSql('CREATE SEQUENCE draw_sessions_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
            $this->addSql('CREATE TABLE draw_sessions (id INT NOT NULL, uuid VARCHAR(255) NOT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, slots JSON NOT NULL, PRIMARY KEY(id))');
            $this->addSql('CREATE INDEX draw_sessions_uuid_idx ON draw_sessions (uuid)');
            $this->addSql('CREATE INDEX draw_sessions_expires_at_idx ON draw_sessions (expires_at)');

            return;
        }

        $this->addSql('CREATE TABLE draw_sessions (id INT AUTO_INCREMENT NOT NULL, uuid VARCHAR(255) NOT NULL, created DATETIME NOT NULL, expires_at DATETIME DEFAULT NULL, slots JSON NOT NULL, INDEX draw_sessions_uuid_idx (uuid), INDEX draw_sessions_expires_at_idx (expires_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        if ($this->connection->getDatabasePlatform()->getName() === 'postgresql') {
            $this->addSql('DROP TABLE draw_sessions');
            $this->addSql('DROP SEQUENCE draw_sessions_id_seq CASCADE');

            return;
        }

        $this->addSql('DROP TABLE draw_sessions');
    }
}
