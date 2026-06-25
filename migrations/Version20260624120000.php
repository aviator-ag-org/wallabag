<?php

namespace Application\Migrations;

use Doctrine\DBAL\Schema\Schema;
use Wallabag\Doctrine\WallabagMigration;

/**
 * Add reading_progress column on entry to persist per-article reading progress.
 */
final class Version20260624120000 extends WallabagMigration
{
    public function up(Schema $schema): void
    {
        $entryTable = $schema->getTable($this->getTable('entry'));

        $this->skipIf($entryTable->hasColumn('reading_progress'), 'It seems that you already played this migration.');

        $entryTable->addColumn('reading_progress', 'integer', [
            'default' => 0,
            'notnull' => true,
        ]);
    }

    public function down(Schema $schema): void
    {
        $entryTable = $schema->getTable($this->getTable('entry'));

        $this->skipIf(!$entryTable->hasColumn('reading_progress'), 'It seems that you already played this migration.');

        $entryTable->dropColumn('reading_progress');
    }
}
