<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20220424130344 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE jinxes ADD target_id INT DEFAULT NULL, ADD trick_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE jinxes ADD CONSTRAINT FK_DC129E1F158E0B66 FOREIGN KEY (target_id) REFERENCES roles (id)');
        $this->addSql('ALTER TABLE jinxes ADD CONSTRAINT FK_DC129E1FB281BE2E FOREIGN KEY (trick_id) REFERENCES roles (id)');
        $this->addSql('CREATE INDEX IDX_DC129E1F158E0B66 ON jinxes (target_id)');
        $this->addSql('CREATE INDEX IDX_DC129E1FB281BE2E ON jinxes (trick_id)');
        $this->addSql('ALTER TABLE roles DROP FOREIGN KEY FK_B63E2EC73B153154');
        $this->addSql('ALTER TABLE roles DROP FOREIGN KEY FK_B63E2EC743B5F743');
        $this->addSql('DROP INDEX IDX_B63E2EC73B153154 ON roles');
        $this->addSql('DROP INDEX IDX_B63E2EC743B5F743 ON roles');
        $this->addSql('ALTER TABLE roles DROP targets_id, DROP tricks_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE jinxes DROP FOREIGN KEY FK_DC129E1F158E0B66');
        $this->addSql('ALTER TABLE jinxes DROP FOREIGN KEY FK_DC129E1FB281BE2E');
        $this->addSql('DROP INDEX IDX_DC129E1F158E0B66 ON jinxes');
        $this->addSql('DROP INDEX IDX_DC129E1FB281BE2E ON jinxes');
        $this->addSql('ALTER TABLE jinxes DROP target_id, DROP trick_id');
        $this->addSql('ALTER TABLE roles ADD targets_id INT DEFAULT NULL, ADD tricks_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE roles ADD CONSTRAINT FK_B63E2EC73B153154 FOREIGN KEY (tricks_id) REFERENCES jinxes (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE roles ADD CONSTRAINT FK_B63E2EC743B5F743 FOREIGN KEY (targets_id) REFERENCES jinxes (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_B63E2EC73B153154 ON roles (tricks_id)');
        $this->addSql('CREATE INDEX IDX_B63E2EC743B5F743 ON roles (targets_id)');
    }
}
