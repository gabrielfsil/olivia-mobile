import realmManager from "../../realm/manager";

const predictHeartBeatService = async () => {
  console.log("Executando predição");
  // Pegar última execução
  const lastExecution = realmManager.getLastExecution();

  let startCreatedAt: Date;

  if (lastExecution) {
    startCreatedAt = lastExecution.created_at;
  } else {
    startCreatedAt = new Date(new Date().getTime() - 1000 * 60 * 20);
  }

  // Pegar localição
  const positions = realmManager.getPositions();

  // Pegar frequências coletadas
  const frequency = realmManager.getHeartBeats(startCreatedAt);

  // Pre processar agrupando localização com frequência
  let positionsData = positions
    .map((item) => {
      return {
        coordinates: item.coordinates as number[],
        created_at: item.created_at,
      };
    })
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  let frequencyData = frequency.map((item) => {
    return {
      heart_rate: item.heart_rate,
      created_at: item.created_at,
    };
  });

  const startDate = new Date(
    Math.min(...positionsData.map((item) => item.created_at.getTime()))
  );

  const endDate = new Date();

  let positionsDataExtended: { created_at: Date; coordinates: number[] }[] = [
    positionsData[0],
  ];

  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setMinutes(d.getMinutes() + 1)
  ) {
    let position = positionsData.find(
      (location) => location.created_at.getTime() === d.getTime()
    );

    positionsDataExtended.push({
      created_at: new Date(d),
      coordinates: position?.coordinates || [],
    });
  }

  let lastCoordinates = positionsData[0].coordinates;

  const positionsDataLongLat = positionsDataExtended.map((item, index) => {
    let long, lat;
    if (item.coordinates.length > 0) {
      lastCoordinates = item.coordinates;
      long = lastCoordinates[0];
      lat = lastCoordinates[1];
    } else if (index > 0) {
      long = lastCoordinates[0];
      lat = lastCoordinates[1];
    }

    return {
      created_at: item.created_at,
      lat,
      long,
    };
  });

  const processedData = positionsDataLongLat.filter(
    (data) => data.created_at.getTime() >= startCreatedAt.getTime()
  );

  const mergedData = frequencyData.map((frequencyItem) => {
    const data_loc = processedData.find(
      (dataItem) =>
        dataItem.created_at.toISOString().slice(0, 16).replace("T", " ") ===
        frequencyItem.created_at.toISOString().slice(0, 16).replace("T", " ")
    );
    return {
      created_at: frequencyItem.created_at
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
      heart_rate: frequencyItem.heart_rate,
      long: data_loc?.long,
      lat: data_loc?.lat,
    };
  });

  const filteredData = mergedData.filter(
    (item) => item.long != undefined || item.lat != undefined
  );

  const preprocessedData = filteredData.map((item) => {
    const [date, time] = item.created_at.split(" ");
    const [hours, minutes] = time.split(":");
    return {
      lat: item.lat,
      long: item.long,
      heart_rate: item.heart_rate,
      hours: parseInt(hours) + parseInt(minutes) / 60,
    };
  });

  const aggregatedData = preprocessedData.reduce((acc, curr) => {
    const key = `${curr.long}-${curr.lat}-${curr.hours}`;
    if (!acc[key]) {
      acc[key] = {
        ...curr,
        count: 1,
        mean: curr.heart_rate,
        max: curr.heart_rate,
        min: curr.heart_rate,
      };
    } else {
      acc[key].count++;
      acc[key].mean += curr.heart_rate;
      acc[key].max = Math.max(acc[key].max, curr.heart_rate);
      acc[key].min = Math.min(acc[key].min, curr.heart_rate);
    }
    return acc;
  }, {} as { [key: string]: { count: number; mean: number; max: number; min: number; lat: number | undefined; long: number | undefined; hours: number } });

  const preprocessed_data = Object.values(aggregatedData).map((item) => ({
    long: item.long,
    lat: item.lat,
    hours: item.hours,
    mean: item.mean / item.count,
    max: item.max,
    min: item.min,
  }));

  const features = preprocessed_data.map((data) => [
    data.long,
    data.lat,
    data.hours,
    data.max,
    data.min,
  ]);
  const target = preprocessed_data.map((data) => data.mean);

  // Carregar modelo

  // Aplicar regressão linear

  // Vericar se há alteração

  // Enviar notificação

  // Salvar execução
  // if (lastExecution) {
  //   realmManager.saveExecution(lastExecution.value);
  // } else {
  //   realmManager.saveExecution(0);
  // }
};

export { predictHeartBeatService };
