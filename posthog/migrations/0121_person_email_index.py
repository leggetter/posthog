# Generated by Django 3.0.11 on 2021-01-05 12:55

from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("posthog", "0120_organization_personalization"),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE INDEX CONCURRENTLY posthog_person_email ON posthog_person((properties->>'email'));",
            reverse_sql='DROP INDEX "posthog_person_email";',
        )
    ]