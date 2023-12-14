import { Badge } from '@/components/ui/badge';
import { PageTitle } from '@/components/ui/page-title';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';
import { db, route } from '@/db';
import { formatMinutes } from '@/lib/time';
import { like, or, sql } from 'drizzle-orm';

type PageParams = {
	searchParams: {
		maxDuration: string;
		minDuration: string;
		aircraft: string;
		airline: string;
	};
};

type RouteResult = {
	id: number;
	origin_iata: string;
	destination_iata: string;
	origin_name: string;
	destination_name: string;
	average_duration: number;
	aircraft_short_names: string;
};

export default async function Routes({ searchParams }: PageParams) {
	const aircraftWhere = searchParams.aircraft
		.split(',')
		.map((a) => like(route.aircraftCodes, `%${a}%`));

	const query = sql`
		SELECT
			route.id,
			route.origin_iata,
			route.destination_iata,
			route.average_duration,
			origin.name AS origin_name,
			destination.name AS destination_name,
			STRING_AGG(aircraft.short_name, ',') AS aircraft_short_names
		FROM
			route
			JOIN airport AS origin ON route.origin_iata = origin.iata_code
			JOIN airport AS destination ON route.destination_iata = destination.iata_code
			JOIN LATERAL UNNEST(string_to_array(route.aircraft_codes, ',')) AS ac_codes ON TRUE
			JOIN aircraft ON aircraft.iata_code = ac_codes
		WHERE
			airline_iata = ${searchParams.airline}
			AND average_duration > ${searchParams.minDuration}
			AND average_duration < ${searchParams.maxDuration}
			AND ${or(...aircraftWhere)}
		GROUP BY
			route.id,
			origin.name,
			destination.name
		ORDER BY
			average_duration;
	`;

	const { rows: routes } = await db.execute<RouteResult>(query);

	return (
		<div>
			<div className="mt-4">
				<PageTitle
					title={`${routes.length} Routes Found`}
					subtitle="Pick a route, and get to flying!"
				/>
			</div>
			<div className="w-screen overflow-scroll lg:w-[calc(100vw-250px)]">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Origin</TableHead>
							<TableHead>Destination</TableHead>
							<TableHead>Average Duration</TableHead>
							<TableHead>Equipment</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{routes.map((r) => (
							<TableRow key={r.id}>
								<TableCell>
									<Tooltip
										trigger={
											<span className="font-medium text-black">
												{r.origin_iata}
											</span>
										}
										children={r.origin_name}
									/>
								</TableCell>
								<TableCell>
									<Tooltip
										trigger={
											<span className="font-medium text-black">
												{r.destination_iata}
											</span>
										}
										children={r.destination_name}
									/>{' '}
								</TableCell>
								<TableCell>{formatMinutes(r.average_duration)}</TableCell>
								<TableCell className="space-x-2">
									{r.aircraft_short_names.split(',').map((ac) => (
										<Badge key={ac} variant="blue">
											{ac}
										</Badge>
									))}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
