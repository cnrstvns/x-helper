import { eq, like, or, sql } from 'drizzle-orm';
import { db, route as routeTable, aircraft as aircraftTable } from '@/db';
import { generateFlightNumber } from '@/lib/flight-number';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/pro-solid-svg-icons/faMap';
import { PageTitle } from '@/components/ui/page-title';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardRow,
	CardTitle,
} from '@/components/ui/card';
import { distanceInNauticalMiles } from '@/lib/distance';
import { formatMinutes } from '@/lib/time';
import { formatElevation } from '@/lib/elevation';
import Link from 'next/link';

type PageParams = {
	params: {
		routeId: string;
	};
	searchParams: {
		aircraft: string;
	};
};

type RouteResult = {
	id: number;
	average_duration: number;
	airline_iata: string;
	airline_name: string;
	airline_logo: string;
	origin_iata: string;
	origin_icao: string;
	origin_name: string;
	origin_city: string;
	origin_country: string;
	origin_elevation: string;
	origin_latitude: string;
	origin_longitude: string;
	destination_iata: string;
	destination_icao: string;
	destination_name: string;
	destination_city: string;
	destination_country: string;
	destination_latitude: string;
	destination_longitude: string;
	destination_elevation: string;
};

type AircraftResult = {
	id: number;
	iata_code: string;
	model_name: string;
	short_name: string;
};

export default async function Page({ params, searchParams }: PageParams) {
	const query = sql`
		SELECT
			route.id,
			route.average_duration,
			airline.iata_code as airline_iata,
			airline.name as airline_name,
			airline.logo_path as airline_logo,
			origin_airport.iata_code as origin_iata,
			origin_airport.icao_code as origin_icao,
			origin_airport.name as origin_name,
			origin_airport.city as origin_city,
			origin_airport.country as origin_country,
			origin_airport.latitude as origin_latitude,
			origin_airport.longitude as origin_longitude,
			origin_airport.elevation as origin_elevation,
			destination_airport.iata_code as destination_iata,
			destination_airport.icao_code as destination_icao,
			destination_airport.name as destination_name,
			destination_airport.city as destination_city,
			destination_airport.country as destination_country,
			destination_airport.latitude as destination_latitude,
			destination_airport.longitude as destination_longitude,
			destination_airport.elevation as destination_elevation
		FROM
			route
		JOIN
			airline on route.airline_iata = airline.iata_code
		JOIN
			airport as origin_airport on route.origin_iata = origin_airport.iata_code
		JOIN
			airport as destination_airport on route.destination_iata = destination_airport.iata_code
		WHERE
			${eq(routeTable.id, parseInt(params.routeId))};
	`;

	const result = await db.execute<RouteResult>(query);
	const route = result.rows[0];

	const parsedAircraft = searchParams.aircraft.split(',');
	const aircraftWhere = parsedAircraft.map((a) =>
		like(aircraftTable.iataCode, `%${a}%`),
	);
	const aircraftQuery = sql`
		SELECT
			*
		FROM
			aircraft
		WHERE
			${or(...aircraftWhere)};
	`;
	const aircraftResult = await db.execute<AircraftResult>(aircraftQuery);
	const aircraft = aircraftResult.rows;

	const flightNumber = generateFlightNumber(route.airline_iata);
	const distanceInNm = distanceInNauticalMiles(
		route.origin_latitude,
		route.origin_longitude,
		route.destination_latitude,
		route.destination_longitude,
	);

	return (
		<div>
			<PageTitle
				title={`Today's flight to ${route.destination_city}`}
				subtitle={`${flightNumber} from ${route.origin_city} to ${route.destination_city}`}
			/>

			<div className="w-full grid grid-cols-1 md:grid-cols-2 p-4 gap-4 items-start">
				<Card>
					<CardHeader>
						<CardTitle>Origin</CardTitle>
						<CardDescription>
							Information about your flight's origin
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CardRow label="Airport Name" value={route.origin_name} />
						<CardRow label="IATA Code" value={route.origin_iata} copyable />
						<CardRow label="ICAO Code" value={route.origin_icao} copyable />
						<CardRow label="City" value={route.origin_city} />
						<CardRow label="Country" value={route.origin_country} />
						<CardRow
							label="Elevation"
							value={formatElevation(route.origin_elevation)}
							copyable
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Destination</CardTitle>
						<CardDescription>
							Information about your flight's destination
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CardRow label="Airport Name" value={route.destination_name} />
						<CardRow
							label="IATA Code"
							value={route.destination_iata}
							copyable
						/>
						<CardRow
							label="ICAO Code"
							value={route.destination_icao}
							copyable
						/>
						<CardRow label="City" value={route.destination_city} />
						<CardRow label="Country" value={route.destination_country} />
						<CardRow
							label="Elevation"
							value={formatElevation(route.destination_elevation)}
							copyable
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Equipment</CardTitle>
						<CardDescription>
							Information about your flight's equipment
						</CardDescription>
					</CardHeader>
					<CardContent>
						{aircraft.map((ac) => (
							<div key={ac.id} className="py-2 border-b last-of-type:border-0">
								<div className="font-medium text-lg">{ac.model_name}</div>
								<CardRow
									key={ac.id}
									label="IATA Code"
									value={ac.iata_code}
									copyable
								/>
							</div>
						))}
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Details</CardTitle>
						<CardDescription>
							Technical details about your flight
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CardRow label="Airline" value={route.airline_name} />
						<CardRow label="Flight Number" value={flightNumber} copyable />
						<CardRow
							label="Average Duration"
							value={formatMinutes(route.average_duration)}
						/>
						<CardRow label="Distance (Direct)" value={`${distanceInNm} nm`} />
						<CardRow
							label="Domestic/International"
							value={
								route.origin_country === route.destination_country
									? 'Domestic'
									: 'International'
							}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>Export</CardTitle>
						<CardDescription>
							Open this flight in your flight planning software
						</CardDescription>
					</CardHeader>

					<CardFooter className="flex space-y-3 md:space-y-0 flex-col md:flex-row space-x-0 md:space-x-2">
						<Button variant="black" size="md" className="w-full">
							<div className="flex items-center">
								Open in Simbrief
								<Image
									src="/external/navigraph.png"
									height={20}
									width={20}
									alt="Navigraph"
									className="ml-2"
								/>
							</div>
						</Button>
						<Link
							href={`https://skyvector.com?fpl=${route.origin_icao}%20${route.destination_icao}`}
							target="_blank"
							className="w-full"
						>
							<Button variant="black" size="md" className="w-full">
								<div className="flex items-center">
									Open in SkyVector
									<FontAwesomeIcon icon={faMap} className="h-5 w-5 ml-2" />
								</div>
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

// skyvector link
// https://skyvector.com/?fpl=%20KLRU%20KCVN
