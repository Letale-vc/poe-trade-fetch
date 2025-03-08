export async function delay(seconds = 0) {
	const timeInMilliseconds = seconds * 1000;
	return new Promise<void>((resolve) => {
		setTimeout(resolve, timeInMilliseconds);
	});
}
