import "../../tests/testUtils/leakedHandles.js";

jest.mock("../useQueueStorage");
jest.mock("../actions/queue/getQueueChannel");
jest.mock("../actions/queue/useQueue");

import { getStoredQueueConfig } from "../useQueueStorage.js";
const mockGetStoredQueueConfig = getStoredQueueConfig as jest.Mock;

import { getQueueChannel } from "../actions/queue/getQueueChannel.js";
const mockGetQueueChannel = getQueueChannel as jest.Mock;

import type { GuildedCommandContext } from "./CommandContext.js";
import { limits } from "./limits.js";

const mockReply = jest.fn().mockResolvedValue(undefined);

describe("Get Queue Limits", () => {
	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			guild: "the-guild",
			user: { id: "the-user" },
			reply: mockReply
		} as unknown as GuildedCommandContext;

		mockGetQueueChannel.mockResolvedValue({
			id: "queue-channel"
		});
		mockGetStoredQueueConfig.mockResolvedValue({
			cooldownSeconds: null,
			entryDurationMaxSeconds: null,
			submissionMaxQuantity: null
		});
	});

	test("cannot show statistics on a queue that does not exist", async () => {
		mockGetQueueChannel.mockResolvedValue(null);
		await expect(limits.execute(context)).resolves.toBeUndefined();
		// TODO: Somehow assert specifics on this case
	});

	test.each`
		cooldownSeconds | entryDurationMaxSeconds | submissionMaxQuantity
		${null}         | ${null}                 | ${null}
		${42}           | ${null}                 | ${null}
		${null}         | ${42}                   | ${null}
		${null}         | ${null}                 | ${42}
		${42}           | ${42}                   | ${null}
		${null}         | ${42}                   | ${42}
		${42}           | ${null}                 | ${42}
		${42}           | ${42}                   | ${42}
	`(
		"shows statistics on queue limits",
		async ({
			cooldownSeconds,
			entryDurationMaxSeconds,
			submissionMaxQuantity
		}: {
			cooldownSeconds: number | null;
			entryDurationMaxSeconds: number | null;
			submissionMaxQuantity: number | null;
		}) => {
			mockGetStoredQueueConfig.mockResolvedValue({
				cooldownSeconds,
				entryDurationMaxSeconds,
				submissionMaxQuantity
			});
			await expect(limits.execute(context)).resolves.toBeUndefined();
			expect(mockReply).toHaveBeenCalledOnce();

			const replyArgs = mockReply.mock.calls[0] as Array<unknown>;
			expect(replyArgs[0]).toMatchSnapshot();
		}
	);
});
