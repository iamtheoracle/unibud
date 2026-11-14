"""Apply Oracle Arc's independent PostgreSQL migrations."""

from __future__ import annotations

import os
from pathlib import Path

import psycopg


def main() -> None:
    database_url = os.getenv("ORACLE_ARC_MIGRATION_DATABASE_URL", "").strip()
    if not database_url:
        raise SystemExit("ORACLE_ARC_MIGRATION_DATABASE_URL is required for migrations.")

    migration_dir = Path(__file__).parent / "migrations"
    migrations = sorted(migration_dir.glob("[0-9][0-9][0-9][0-9]_*.sql"))
    if not migrations:
        raise SystemExit("No Oracle Arc migrations were found.")

    with psycopg.connect(database_url) as connection:
        for migration in migrations:
            sql = migration.read_text(encoding="utf-8")
            connection.execute(sql, prepare=False)
            print(f"Applied {migration.name}")


if __name__ == "__main__":
    main()
