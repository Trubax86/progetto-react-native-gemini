import { formatMessageTime } from '../../utils/dateUtils';

describe('dateUtils', () => {
  it('formatta correttamente l\'ora di oggi', () => {
    const now = new Date();
    const formatted = formatMessageTime(now);
    expect(formatted).toMatch(/^\d{2}:\d{2}$/);
  });

  it('formatta correttamente la data di ieri', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = formatMessageTime(yesterday);
    expect(formatted).toMatch(/^Ieri \d{2}:\d{2}$/);
  });

  it('formatta correttamente una data passata', () => {
    const pastDate = new Date('2023-01-01 15:30');
    const formatted = formatMessageTime(pastDate);
    expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/);
  });
});