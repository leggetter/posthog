from django.db import connection
from rest_framework import request, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from posthog.models import Event, Filter, Team
from posthog.queries import paths
from posthog.utils import StructuredViewSetMixin, dict_from_cursor_fetchall, request_to_date_query


class PathsViewSet(StructuredViewSetMixin, viewsets.ViewSet):
    @action(methods=["GET"], detail=False)
    def elements(self, request: request.Request):

        rows = self.get_elements(request)
        return Response(rows)

    def get_elements(self, request: request.Request):
        all_events = Event.objects.filter(team_id=self.get_parents_query_dict()["team_id"], event="$autocapture")
        all_events_SQL, sql_params = all_events.query.sql_with_params()

        elements_readble = '\
            SELECT tag_name_source as name, group_id as id FROM (SELECT \'<\' || e."tag_name" || \'> \'  || e."text" as tag_name_source, e."text" as text_source, e.group_id FROM "posthog_element" e\
                JOIN ( SELECT group_id, MIN("posthog_element"."order") as minOrder FROM "posthog_element" GROUP BY group_id) e2 ON e.order = e2.minOrder AND e.group_id = e2.group_id) as element\
                JOIN (SELECT id, hash, count FROM posthog_elementgroup  as g JOIN (SELECT count(*), elements_hash from ({}) as a group by elements_hash) as e on g.hash = e.elements_hash) as outer_group ON element.group_id = outer_group.id  where text_source <> \'\' order by count DESC, name limit 20\
        '.format(
            all_events_SQL
        )
        cursor = connection.cursor()
        cursor.execute(elements_readble, sql_params)
        rows = dict_from_cursor_fetchall(cursor)
        return rows

    # FIXME: Timestamp is timezone aware timestamp, date range uses naive date.
    # To avoid unexpected results should convert date range to timestamps with timezone.
    def list(self, request):
        resp = self.get_list(request)
        return Response(resp)

    def get_list(self, request):
        team = Team.objects.get(self.get_parents_query_dict()["team_id"])
        date_query = request_to_date_query(request.GET, exact=False)
        filter = Filter(request=request)
        start_point = request.GET.get("start")
        request_type = request.GET.get("type", None)
        resp = paths.Paths().run(
            filter=filter, start_point=start_point, date_query=date_query, request_type=request_type, team=team,
        )
        return resp
